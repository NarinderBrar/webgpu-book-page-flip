"use strict";

const webgpuDevice = new WebGPUDevice();

let camera; 

async function init() 
{
   try {
      await webgpuDevice.initWebGPU();
      this.renderer = new Renderer(webgpuDevice);
      await this.renderer.createRenderPipeline(); 
      this.device = webgpuDevice.getDevice();
   }
   catch (e) 
   {
       document.getElementById("message").innerHTML = "<span style='color:#AA0000; font-size:110%'><b>Error: Could not initialize WebGPU: </b>" +  e.message + "</span>";
       return;
   }


   document.getElementById("light").value = "1";
   document.getElementById("diffuse").value = "0";
   document.getElementById("specular").value = "8";
   document.getElementById("exponent").value = "10";

   document.getElementById("light").onchange = () => 
   {
       this.uniformManager.update("lightPosition",  this.uniformManager.lightPositions[ Number(document.getElementById("light").value) ]);
     render(this.renderer, this.uniformManager);
   };

   document.getElementById("diffuse").onchange = () => 
   {
       this.uniformManager.update("diffuseColor",  this.uniformManager.colors[ Number(document.getElementById("diffuse").value) ]);
     render(this.renderer, this.uniformManager);
   }

   document.getElementById("specular").onchange = () => 
   {
       this.uniformManager.update("specularColor",  this.uniformManager.colors[ Number(document.getElementById("specular").value) ]);
     render(this.renderer, this.uniformManager);
   }
   
   document.getElementById("exponent").onchange = () => 
   {
       this.uniformManager.update("specularExponent", Number(document.getElementById("exponent").value));
      render(this.renderer, this.uniformManager);
   }

   const cameraCallback = () => 
   {
      let viewMatrix = camera.getViewMatrix();
      this.uniformManager.update("modelview", viewMatrix);
      this.uniformManager.update("normalMatrix", wgpuMatrix.mat3.fromMat4(viewMatrix));
      render(this.renderer, this.uniformManager);
   }

   camera = new Camera(webgpuDevice.getContext().canvas, cameraCallback, 15);

   this.book = new Book(this.device,30);
   this.book2 = new Book(this.device,90);
   this.book3 = new Book(this.device,180);
   
   this.uniformManager = new UniformManager(this.device, camera);

   this.uniformManager.createUniformBuffer();
   this.uniformManager.createBindingGroup(this.renderer.getRenderPipeline());
   this.uniformManager.setData();
   render(this.renderer, this.uniformManager);;

   // const compute = new Compute(webgpuDevice);
   // compute.createRenderPipeline();
   // compute.invertNormals(this.book.model.normalBufferCompute, 50);
}

function render(renderer, uniformManager)
{
   renderer.begin( uniformManager);
   renderer.draw(book.getModel());
   renderer.draw(book2.getModel());
   renderer.draw(book3.getModel());
   renderer.end();
}


window.onload = init;

