class Renderer
{
    constructor(webGPUDevice)
    {
        this.device = webGPUDevice.getDevice();
        this.context = webGPUDevice.getContext();

       this.shader =  this.device.createShaderModule({
            code: shaderSource
            });

        this.depthTexture =  this.device.createTexture({
            size: [this.context.canvas.width, this.context.canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }

   async createRenderPipeline()
    {
        let vertexBufferLayout = [
            { // first vertex buffer, for coords
                attributes: [ { shaderLocation:0, offset:0, format: "float32x3" } ],
                arrayStride: 12,
                stepMode: "vertex" 
            },

            { // second vertex buffer, for normals
                attributes: [ { shaderLocation:1, offset:0, format: "float32x3" } ],
                arrayStride: 12,
                stepMode: "vertex" 
            }
            ];
        
            let pipelineDescriptor = {
                vertex: 
                {
                    module: this.shader,
                    entryPoint: "vmain",
                    buffers: vertexBufferLayout
                },

                fragment: 
                {
                    module: this.shader,
                    entryPoint: "fmain",
                    targets: 
                    [
                        {
                            format: navigator.gpu.getPreferredCanvasFormat()
                        }
                    ]
                },

                depthStencil: 
                {
                    depthWriteEnabled: true,
                    depthCompare: "less",
                    format: "depth24plus",
                },

                primitive: 
                {
                    topology: "triangle-list",
                    cullMode: "none"  // no need to draw back faces, since all objects are closed solids.
                },

                layout: "auto"
            };
            
            this.renderPipeline = await  this.device.createRenderPipelineAsync(pipelineDescriptor);
    }

    begin(uniformManager)
    {
        this.commandEncoder = this.device.createCommandEncoder();

        let renderPassDescriptor = 
        {
            colorAttachments: 
            [
                {
                    clearValue: { r: 0.15, g: 0.15, b: 0.3, a: 1 },
                    loadOp: "clear",
                    storeOp: "store",
                    view:  this.context.getCurrentTexture().createView()
                }
            ],

            depthStencilAttachment: 
            {
                view:  this.depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            }
        };

        this.passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);
        this.passEncoder.setPipeline(this.renderPipeline);
        this.passEncoder.setBindGroup(0,uniformManager.uniformBindGroup);
    }

    draw(currentObject) 
    {
        this.passEncoder.setVertexBuffer(0,currentObject.coordsBuffer);
        this.passEncoder.setVertexBuffer(1,currentObject.normalBuffer);
        this.passEncoder.setIndexBuffer(currentObject.indexBuffer,"uint16");

        this.passEncoder.drawIndexed(currentObject.count);
    }

    end()
    {
        this.passEncoder.end();
        this.device.queue.submit([this.commandEncoder.finish()]);   
    }

    getRenderPipeline() 
    {
        return this.renderPipeline
    }
}