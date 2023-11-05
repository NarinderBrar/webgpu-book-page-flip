class Compute 
{
    constructor(webGPUDevice)
    {
        this.device = webGPUDevice.getDevice();
    }

    createRenderPipeline()
    {
       this.pipeline = this.device.createComputePipeline({
            label: 'Normal Inversion Pipeline',
            layout: 'auto',
            compute: {
              module: this.device.createShaderModule({ code: shaderSource }),
              entryPoint: 'invertNormals',
            }
          });

          this.uniformBuffer = this.device.createBuffer({
            label: 'Normal Inversion Uniform Buffer',
            size: 4092, // Minimum uniform buffer size
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
          });
          
          this.uniformArray = new Uint32Array(this.uniformBuffer.size / Uint32Array.BYTES_PER_ELEMENT);
    }

    updateUniforms(vertexCount) {
        // Write the vertex count into the uniform buffer
        this.uniformArray[0] = vertexCount;
        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformArray);
    }

    invertNormals(normalBuffer, vertexCount) {
        this.updateUniforms(vertexCount);
        
        // Create a bind group with the normal buffer and uniform buffer
        const bindGroup = this.device.createBindGroup({
          label: 'Normal Inversion Bind Group',
          layout: this.pipeline.getBindGroupLayout(0),
          entries: [{
            binding: 0,
            resource: { buffer: this.uniformBuffer },
          }, {
            binding: 1,
            resource: { buffer: normalBuffer },
          }]
        });
    
        // Encode a compute pass that executes the compute shader.
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginComputePass();
    
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, bindGroup);
    
        // Dispatch the necessary number of workgroups.
        // Note that we divide the vertex count by the workgroup_size!
        pass.dispatchWorkgroups(Math.ceil(vertexCount / 64));
    
        pass.end();
        this.device.queue.submit([ encoder.finish() ]);
      }

}