from flask import Flask, request, jsonify
import google.generativeai as genai
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def call_gemini(api_key, model, messages, generation=None, safety=None, expect_json=False):
    """Call Google Gemini API with configurable model and generation params."""
    genai.configure(api_key=api_key)

    # Convert messages to Gemini format
    system_prompt = ""
    user_prompt = ""

    for msg in messages:
        if msg.get("role") == "system":
            system_prompt = msg.get("content", "")
        elif msg.get("role") == "user":
            user_prompt = msg.get("content", "")

    # Combine system and user prompts
    full_prompt = f"{system_prompt}\n\n{user_prompt}" if system_prompt else user_prompt

    # Resolve model and generation params
    requested_model = model or 'gemini-2.5-pro'
    gen_cfg = generation or {}
    temperature = gen_cfg.get('temperature', 0.7)
    max_output_tokens = gen_cfg.get('max_output_tokens', 2000)
    top_p = gen_cfg.get('top_p', 0.8)
    top_k = gen_cfg.get('top_k', 40)
    candidate_count = gen_cfg.get('candidate_count', 1)
    stop_sequences = gen_cfg.get('stop_sequences', [])

    # Prepare generation config
    generation_config = genai.types.GenerationConfig(
        max_output_tokens=max_output_tokens,
        temperature=temperature,
        candidate_count=candidate_count,
        stop_sequences=stop_sequences,
        top_p=top_p,
        top_k=top_k,
        # Some SDKs support explicit JSON MIME; include if requested
        **({"response_mime_type": "application/json"} if expect_json else {})
    )

    safety_settings = safety if isinstance(safety, list) else [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
    ]

    def _generate_with(model_name):
        model_instance = genai.GenerativeModel(model_name)
        return model_instance.generate_content(
            full_prompt,
            generation_config=generation_config,
            safety_settings=safety_settings
        )

    try:
        response = _generate_with(requested_model)
    except Exception as e:
        # fallback to a fast model if the requested one errors
        try:
            response = _generate_with('gemini-2.0-flash')
        except Exception as e2:
            raise Exception(f"Gemini API error with model {requested_model}: {str(e)}. Fallback also failed: {str(e2)}")

    # Normalize response
    content_text = getattr(response, 'text', None)

    # Try to build text from candidates/parts when response.text is unavailable
    if not content_text and hasattr(response, 'candidates'):
        try:
            collected = []
            for cand in (getattr(response, 'candidates', []) or []):
                # finish_reason 2 indicates SAFETY; capture anyway
                content = getattr(cand, 'content', None)
                if content and hasattr(content, 'parts'):
                    for part in (content.parts or []):
                        # New SDK: part.text; Older SDKs: str(part)
                        text_piece = getattr(part, 'text', None)
                        if isinstance(text_piece, str) and text_piece.strip():
                            collected.append(text_piece)
                # Fallback: try cand.text directly if exists
                cand_text = getattr(cand, 'text', None)
                if isinstance(cand_text, str) and cand_text.strip():
                    collected.append(cand_text)
            if collected:
                content_text = "\n".join(collected)
        except Exception:
            content_text = None

    # If still no text, inspect prompt feedback/safety and return descriptive content
    if not content_text:
        safety_info = None
        finish_reason = None
        try:
            finish_reason = getattr(response, 'candidate', None)
        except Exception:
            finish_reason = None
        try:
            pf = getattr(response, 'prompt_feedback', None)
            if pf and hasattr(pf, 'safety_ratings'):
                safety_info = [
                    {
                        "category": getattr(r, 'category', None),
                        "probability": getattr(r, 'probability', None),
                        "blocked": getattr(r, 'blocked', None),
                    }
                    for r in (getattr(pf, 'safety_ratings', []) or [])
                ]
        except Exception:
            safety_info = None

        # Return a non-empty content string with diagnostic context to avoid 500s upstream
        content_text = (
            "Model returned no text. The response may have been blocked by safety filtering or contained no text parts."
        )

        return {
            "content": content_text,
            "usage": {
                "prompt_tokens": len(full_prompt.split()) if isinstance(full_prompt, str) else 0,
                "completion_tokens": 0,
                "total_tokens": len(full_prompt.split()) if isinstance(full_prompt, str) else 0,
            },
            "note": "no_text",
            "safety": safety_info or [],
        }

    return {
        "content": content_text,
        "usage": {
            # SDKs vary; approximate token counts
            "prompt_tokens": len(full_prompt.split()) if isinstance(full_prompt, str) else 0,
            "completion_tokens": len(content_text.split()) if isinstance(content_text, str) else 0,
            "total_tokens": (
                (len(full_prompt.split()) if isinstance(full_prompt, str) else 0)
                + (len(content_text.split()) if isinstance(content_text, str) else 0)
            )
        }
    }

@app.route('/api/ai-chat', methods=['POST'])
def ai_chat():
    try:
        data = request.get_json()
        
        api_key = data.get('apiKey', '')
        model = data.get('model', 'gemini-2.5-pro')
        messages = data.get('messages', [])
        
        if not api_key:
            return jsonify({"error": "API key is required"}), 400
        
        if not messages:
            return jsonify({"error": "Messages are required"}), 400
        
        # Call Gemini with full user-configurable params
        result = call_gemini(
            api_key,
            model,
            messages,
            generation=data.get('generation'),
            safety=data.get('safety'),
            expect_json=True
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/defense-analysis', methods=['POST'])
def defense_analysis():
    try:
        data = request.get_json()
        
        api_key = data.get('apiKey', '')
        model = data.get('model', 'gemini-2.5-pro')
        impact_data = data.get('impactData', {})
        
        if not api_key:
            return jsonify({"error": "API key is required"}), 400
        
        if not impact_data:
            return jsonify({"error": "Impact data is required"}), 400
        
        # Create the prompt for defense strategy analysis
        system_prompt = """You are an expert planetary defense scientist and AI assistant specializing in meteor deflection strategies. Your task is to analyze meteor impact data and provide detailed, scientific explanations for defense mechanism recommendations.

IMPORTANT: Always use the term "meteor" instead of "asteroid" throughout your analysis.

You must provide:
1. Detailed analysis for each defense method (Kinetic Impactor, Gravity Tractor, Nuclear Device)
2. Scientific reasoning for why each method is favorable or unfavorable
3. Specific recommendations based on the meteor's impact parameters, warning time, and composition
4. Real scientific sources and references with actual URLs
5. Professional, technical language appropriate for planetary defense
6. Always consider warning time, meteor size, velocity, density, impact angle, and potential environmental effects when evaluating strategies

Format your response as JSON with the following structure:
{
  "kineticImpactor": {
    "favorability": "high|medium|low",
    "success_rate": "percentage string",
    "analysis": "detailed explanation",
    "reasoning": "scientific reasoning",
    "pros": ["advantage1", "advantage2"],
    "cons": ["disadvantage1", "disadvantage2"]
  },
  "gravityTractor": {
    "favorability": "high|medium|low", 
    "success_rate": "percentage string",
    "analysis": "detailed explanation",
    "reasoning": "scientific reasoning",
    "pros": ["advantage1", "advantage2"],
    "cons": ["disadvantage1", "disadvantage2"]
  },
  "nuclearDevice": {
    "favorability": "high|medium|low",
    "success_rate": "percentage string",
    "analysis": "detailed explanation", 
    "reasoning": "scientific reasoning",
    "pros": ["advantage1", "advantage2"],
    "cons": ["disadvantage1", "disadvantage2"]
  },
  "recommendation": {
    "primary": "kineticImpactor|gravityTractor|nuclearDevice",
    "reasoning": "why this is the best choice",
    "backup": "secondary option",
    "urgency": "high|medium|low"
  },
  "sources": [
    {
      "title": "Source Title",
      "url": "https://actual-url.com",
      "type": "research|mission|organization"
    }
  ]
}

CRITICAL GUIDELINES:
1. Consider **meteor size, velocity, density, warning time, and composition** in determining favorability.
2. Kinetic Impactors are PROVEN technology (e.g., DART mission) and should be highly favored for smaller meteors when adequate lead time is available.
3. Gravity Tractors are effective with **long lead times (5–10 years)** and provide gentle, precise deflection.
4. Nuclear Devices have **high success potential**, especially for large meteors (>500m) or when **warning time is short**, but risk fragmentation.
5. Never assign all three methods “low” favorability.
6. Adjust success rates dynamically based on meteor parameters and warning time.
7. Include clear, realistic pros and cons for each method.
8. Be optimistic about proven technologies, but realistic about high-risk or untested options.

MANDATORY TIME-BASED EXAMPLES:
- **If meteor diameter <200m:**
  - With **>5 years warning time** →  
    Kinetic Impactor: “high” favorability (85–95% success)  
    Gravity Tractor: “medium” (70–85%)  
    Nuclear Device: “low” (90–98%, high fragmentation risk)
  - With **<2 years warning time** →  
    Kinetic Impactor: “medium” (80–90%) due to limited prep time  
    Gravity Tractor: “low” (ineffective for short notice)  
    Nuclear Device: “medium” (rapid deployment possible)

- **If meteor diameter 200–500m:**
  - With **>10 years warning time** →  
    Gravity Tractor: “medium–high” (75–85%)  
    Kinetic Impactor: “high” (85–92%)  
    Nuclear Device: “medium” (92–95%)
  - With **<5 years warning time** →  
    Kinetic Impactor: “medium” (80–88%)  
    Gravity Tractor: “low” (insufficient time)  
    Nuclear Device: “high” (94–98%, faster deflection)

- **If meteor diameter >500m:**
  - With **>10 years warning time** →  
    Nuclear Device: “high” (90–95%) but include fragmentation warning  
    Kinetic Impactor: “medium” (75–85%)  
    Gravity Tractor: “low” (too slow for mass)
  - With **<5 years warning time** →  
    Nuclear Device: “high” (95–98%) as only viable rapid option  
    Kinetic Impactor: “medium” (70–80%)  
    Gravity Tractor: “low” (ineffective due to mass and time)

- Always reflect urgency based on the warning time:
  - **<2 years** → “high” urgency  
  - **2–5 years** → “medium” urgency  
  - **>5 years** → “low” urgency
"""

        # Safely extract fields (dictionary-style) with camelCase/snake_case fallbacks
        diameter = impact_data.get('diameter', impact_data.get('diameter_m', 0))
        velocity = impact_data.get('velocity', impact_data.get('velocity_mps', 0))
        density = impact_data.get('density', impact_data.get('density_kgm3', 0))
        angle = impact_data.get('angle', impact_data.get('impact_angle', 0))
        kinetic_energy = impact_data.get('kinetic_energy', impact_data.get('_ai_kineticEnergyJ', 0))
        tnt_equivalent = impact_data.get('tnt_equivalent', 0)

        env = impact_data.get('environmental_effects', {}) or {}
        atmos = env.get('atmospheric_disturbance', 'unknown')
        biodiversity = env.get('biodiversity_threat', 'unknown')
        climate = env.get('climate_impact_duration', 0)

        # Pre-check computed values from frontend (if present)
        mass_kg = impact_data.get('_ai_massKg', impact_data.get('mass', impact_data.get('mass_kg', 0)))
        delta_v = impact_data.get('_ai_deltaV_mps', impact_data.get('deltaV', impact_data.get('delta_v', 0)))
        warning_time_years = impact_data.get('warningTime', impact_data.get('warning_time', impact_data.get('_ai_warningTimeYears', '')))

        user_prompt = f"""Analyze the following meteor impact data and provide a defense strategy recommendation:

Meteor Parameters:
- Diameter: {diameter} meters
- Velocity: {velocity} m/s
- Density: {density} kg/m³
- Impact Angle: {angle} degrees
- Kinetic Energy: {kinetic_energy} J
- TNT Equivalent: {tnt_equivalent} kg

Environmental Effects:
- Atmospheric Disturbance: {atmos}
- Biodiversity Threat: {biodiversity}
- Climate Impact Duration: {climate} months

Pre-check Computations (for context):
- Mass: {mass_kg} kg  # mass = (4/3)·π·(diameter/2)^3·density
- Estimated Δv: {delta_v} m/s  # Δv ≈ lateral displacement / warning time
- Warning Time: {warning_time_years} years

Task:
1. Evaluate all three defense strategies (Gravity Tractor, Kinetic Impactor, Nuclear Device).
2. Recommend the most suitable option based on the data.
3. Justify your choice with scientific reasoning, considering Δv, lead time, impact energy, and environmental effects.
4. Present the response in a structured format (e.g., table or bullet points) and include references.
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        # Call Gemini with full user-configurable params
        result = call_gemini(
            api_key,
            model,
            messages,
            generation=data.get('generation'),
            safety=data.get('safety'),
            expect_json=True
        )
        
        # Try to parse the JSON response - handle markdown code blocks
        try:
            response_text = result["content"]
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            elif response_text.startswith("```"):
                response_text = response_text.replace("```", "").strip()
            
            analysis_data = json.loads(response_text)
        except json.JSONDecodeError as e:
            # If not valid JSON, return the raw content
            analysis_data = {
                "raw_content": result["content"],
                "error": f"Response was not in expected JSON format: {str(e)}"
            }
        
        return jsonify({
            "analysis": analysis_data,
            "usage": result.get("usage", {}),
            "provider": "gemini",
            "model": model
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "message": "AI API server is running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
