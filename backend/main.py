from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image, UnidentifiedImageError
import torch
from torchvision import transforms
from transformers import AutoModelForImageSegmentation
import io
import os
from dotenv import load_dotenv
from time import time
from pydantic import BaseModel

class ModelInfo(BaseModel):
    model: str
    url: str
    model_processing_time: int

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "briaai/RMBG-2.0"
MODEL_URL = "https://huggingface.co/briaai/RMBG-2.0"
MODEL_PROCESSING_TIME = 25 if os.getenv('ENVIRONMENT') in ('development', 'production') else 9

# Initialize model with constant
model = AutoModelForImageSegmentation.from_pretrained(MODEL_NAME, trust_remote_code=True)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
model.eval()

# Setup image transformation
image_size = (1024, 1024)
transform_image = transforms.Compose([
    transforms.Resize(image_size),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.post("/api/remove-background")
async def remove_background(file: UploadFile = File(...)):    
    start_time = time()
    print(f"\nStarting background removal at: {start_time}")
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail=f"File must be an image. Got {file.content_type}")
        
    try:
        contents = await file.read()
        io_buffer = io.BytesIO(contents)
        image = Image.open(io_buffer)
        
        load_time = time() - start_time
        print(f"Load time: {round(load_time, 3)}s")
        model_start = time()
        
        # Remove transparency from image and convert to RGB
        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Tranform and normalize image
        input_image = transform_image(image).unsqueeze(0).to(device)
        
        # Predict background removal
        with torch.no_grad():
            preds = model(input_image)[-1].sigmoid().cpu()
        
        # Convert prediction to mask
        pred = preds[0].squeeze()
        pred_pil = transforms.ToPILImage()(pred)
        mask = pred_pil.resize(image.size)
        
        # Apply mask to image
        image.putalpha(mask)
        
        # Save result
        output_path = "temp_output.png"
        image.save(output_path)
        
        inference_time = time() - model_start
        print(f"Inference time: {round(inference_time, 3)}s")
        post_start = time()
        
        post_time = time() - post_start
        total_time = time() - start_time
        print(f"Post-processing time: {round(post_time, 3)}s")
        print(f"Total time: {round(total_time, 3)}s\n")
        
        # Return the processed image
        return FileResponse(output_path)
        
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Cannot process this image format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model-info", response_model=ModelInfo)
async def get_model_info():
    return ModelInfo(
        model=MODEL_NAME,
        url=MODEL_URL,
        model_processing_time=MODEL_PROCESSING_TIME
    )
