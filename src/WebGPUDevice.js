class WebGPUDevice
{
    constructor()
    {

    }

    async initWebGPU() {

        if (!navigator.gpu) {
        throw Error("WebGPU not supported in this browser.");
        }
        let adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
        throw Error("WebGPU is supported, but couldn't get WebGPU adapter.");
        }
    
        this.device = await adapter.requestDevice();
    
        let canvas = document.getElementById("webgpuCanvas");

        this.context = canvas.getContext("webgpu");
        this.context.configure(
            {
                device:  this.device,
                format: navigator.gpu.getPreferredCanvasFormat(),
                alphaMode: "premultiplied"
            });
    }

    getContext()
    {
        return this.context;
    }

    getDevice()
    {
        return this.device;
    }
}