class Book
{
    constructor(device, angle) 
    { 
        this.model = new BookMesh(angle);

        this.model.count = this.model.indices.length;

        this.model.coordsBuffer = device.createBuffer(
        { 
            size: this.model.vertexPositions.byteLength, 
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.model.normalBuffer = device.createBuffer(
        { 
            size: this.model.vertexNormals.byteLength, 
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST 
        });

        this.model.normalBufferCompute = device.createBuffer(
        { 
            label: 'Normal Inversion normalBufferCompute Buffer',
            size: this.model.vertexNormals.byteLength, 
            usage:  GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
        });
    
        this.model.indexBuffer = device.createBuffer({ 
            size: this.model.indices.byteLength, 
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST 
        });

        device.queue.writeBuffer(this.model.coordsBuffer,0,this.model.vertexPositions);
        device.queue.writeBuffer(this.model.normalBuffer,0,this.model.vertexNormals);
        device.queue.writeBuffer(this.model.indexBuffer,0,this.model.indices);

        device.queue.writeBuffer(this.model.normalBufferCompute,0,this.model.vertexNormals);
    }

    getModel()
    {
        return this.model;
    }
}