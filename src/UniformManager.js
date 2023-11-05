class UniformManager 
{
    uniformData = new Float32Array(56); 

    uniforms = 
    {
        modelview:        { size: 16, offset: 0  }, 
        projection:       { size: 16, offset: 16 },
        normalMatrix:     { size: 12, offset: 32 },
        lightPosition:    { size:  4, offset: 44 },
        diffuseColor:     { size:  3, offset: 48 },
        specularColor:    { size:  3, offset: 52 },
        specularExponent: { size:  1, offset: 55 }
    };
    
   lightPositions = [[0,0,0,1], [0,0,1,0], [0,1,0,0], [0,0,-10,1], [2,3,5,0] ];
   colors = [[1,1,1], [1,0,0], [0,1,0], [0,0,1], [0,1,1], [1,0,1], [1,1,0], [0,0,0], [0.5,0.5,0.5]];
    
   constructor(device, camera) 
   {
       this.device = device;
       this.camera = camera;
    }

   createUniformBuffer()
   {
      const usage =  GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST

      const descriptor = {
         //size: vertices.byteLength,
         size: 56*4,
         usage: usage,
      };
   
      this.uniformBuffer =  this.device.createBuffer(descriptor); 
   }

   createBindingGroup(renderPipeline)
   {
       this.uniformBindGroup =  this.device.createBindGroup({
           layout: renderPipeline.getBindGroupLayout(0),
           entries: [
           {
               binding: 0,
               resource: {buffer: this.uniformBuffer, offset: 0, size: 56*4}
           }
           ]
       });
   }

   setData()
   {
      let viewMatrix = this.camera.getViewMatrix();
      let projectionMatrix = wgpuMatrix.mat4.perspective(Math.PI/5,1,10,20);
      let normalMatrix = wgpuMatrix.mat3.fromMat4(viewMatrix); 
      let lightPos = this.lightPositions[ Number(document.getElementById("light").value) ];
      let diffuse = this.colors[ Number(document.getElementById("diffuse").value) ];
      let specular = this.colors[ Number(document.getElementById("specular").value) ];
      let exponent = Number(document.getElementById("exponent").value);
      
      this.uniformData.set(viewMatrix,0);
      this.uniformData.set(projectionMatrix,16);
      this.uniformData.set(normalMatrix,32);
      this.uniformData.set(lightPos,44);
      this.uniformData.set(diffuse,48);
      this.uniformData.set(specular,52);
      this.uniformData[55] = exponent;

      device.queue.writeBuffer(this.uniformBuffer,0,this.uniformData);
   }

   update(itemName, value) 
   {
      let data = this.uniforms[itemName];

      if (data.size === 1)
         this.uniformData[data.offset] = value;
      else
         this.uniformData.set(value, data.offset);

      this.device.queue.writeBuffer(this.uniformBuffer, 4*data.offset, this.uniformData, data.offset, data.size);
   }
    
}