import os
from flask import Flask, request, jsonify
from diffusers import StableDiffusionPipeline
import torch

app = Flask(__name__)

# Set up the Stable Diffusion model pipelineprint("Loading Stable Diffusion model...")
print("Loading Stable Diffusion model...")
pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float32)
print("Model loaded successfully.")


# Ensure the model runs on CPU, and remove float16 for CPU usage
pipe.to("cpu")

@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.json
    print("Received a request...")
    prompt = data.get("prompt")
    print(f"Prompt: {prompt}")

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        # Generate the image
        image = pipe(prompt).images[0]
        
        # Save the generated image
        image_path = "generated_image.png"
        image.save(image_path)
        print(f"Image saved to {image_path}")

        return jsonify({"image_url": image_path}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
