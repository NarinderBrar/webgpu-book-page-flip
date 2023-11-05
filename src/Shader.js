const shaderSource = `
    struct UniformData {
        modelview : mat4x4f,   // size 16, offset 0  
        projection : mat4x4f,  // size 16, offset 16 (measured in 4-byte floats)
        normalMatrix : mat3x3f,// size 12, offset 32
        lightPosition : vec4f, // size  4, offset 44
        diffuseColor : vec3f,  // size  3, offset 48
        specularColor : vec3f, // size  3, offset 52
        specularExponent : f32 // size  1, offset 55
    }
    
    @group(0) @binding(0) var<uniform> uniformData : UniformData;
    
    
    
    struct VertexOut {
        @builtin(position) position : vec4f,
        @location(0) normal : vec3f,
        @location(1) eyeCoords : vec3f
    }
    
    @vertex
    fn vmain( @location(0) coords: vec3f,
              @location(1) normal: vec3f , @builtin(vertex_index) vertexIndex : u32) -> VertexOut 
    {
        const angle_in_degrees:f32 = 10.0;
		const page_length:f32 = 5.0;
		const page_width:f32 = 3.0;
        const PI:f32 = 3.14159;
		const angle_in_radians:f32 = angle_in_degrees * PI/180;
		const max_height:f32 = 1.0;
        var pos: vec3f;

		var direction:f32 ;

        if(angle_in_degrees > 90) 
        {
            direction = -1.0;
        } 
        else
        {
            direction = 1.0;
        }

		const length_segment_count = 10;
		const length_segment_size = page_length / length_segment_count;

		// generate coords and normals for the curved planar surface
        const piMA = (PI/2 - angle_in_radians);
        const piBB = max_height * piMA;
		var length_curved_part = direction * piBB;
		const curved_part_segment_count = 25;
		var curved_part_segment_size = length_curved_part/curved_part_segment_count;

		var x:f32;
        var y:f32;
        var z:f32;

        var l:f32;
        var c:f32;
        var s:f32;

		var k:u32 = 0;

		for ( var i = 0; i <= curved_part_segment_count/3; i++ ) {
			l = (f32(i) * curved_part_segment_size ) / max_height;
			c = cos(l);
			s = sin(l);
			x = direction * max_height * (1 - c);
			y = max_height * s;

			for ( var j = 0; j <= length_segment_count; j ++ ) 
			{
				z = ( f32(j) * length_segment_size ) - page_length/2;
				pos = vec3f(x,y,z);
			}
			k += 3;
		}

		// generate coords and normals for the flat planar surface
		var x_start = x;
		var y_start = y;
		var length_flat_part = page_width - length_curved_part;
		var flat_part_segment_count = 5;
		var flat_part_segment_size = f32(length_flat_part) / f32(flat_part_segment_count);

		for ( var i = 1; i <= flat_part_segment_count; i ++ ) {
			l = ( f32(i) * flat_part_segment_size );
			x = x_start + l * s * direction;
			y = y_start + l * c;

			for ( var j = 0; j <= length_segment_count; j ++ ) {
				z = ( f32(j) * length_segment_size ) - page_length/2;
                pos = vec3f(x,y,z);
			}

			k += 3;
		}

        var eyeCoords = uniformData.modelview * vec4f(coords,1);
        var output : VertexOut;
        output.position = uniformData.projection * eyeCoords;
        output.normal = normalize(normal);
        output.eyeCoords = eyeCoords.xyz/eyeCoords.w;
        return output;
    }
    
    @fragment
    fn fmain( @location(0) normal : vec3f,
              @location(1) eyeCoords : vec3f ) -> @location(0) vec4f {
        var N : vec3f;  // normalized normal vector
        var L : vec3f;  // unit vector pointing towards the light source
        var R : vec3f;  // reflected vector of L
        var V : vec3f;  // unit vector pointing towards the viewer
        N = normalize( uniformData.normalMatrix * normal );
        if ( uniformData.lightPosition.w == 0.0 ) { // directional ligh
            L = normalize( uniformData.lightPosition.xyz );
        }
        else { // positional light
            L = normalize( uniformData.lightPosition.xyz/uniformData.lightPosition.w - eyeCoords );
        }
        if ( dot(L,N) <= 0.0 ) { // light does not illuminate this point
            return vec4f(0,0,0,1);
        }
        else {
            R = -reflect(L,N);
            V = normalize(-eyeCoords);  // (Assumes a perspective projection.)
            var color = 0.8*dot(L,N) * uniformData.diffuseColor;  // diffuse reflection
                  // constant multiples on colors are to avoid over-saturating the total color
            if (dot(R,V) > 0.0) {  // add in specular reflection
                color += 0.4*pow(dot(R,V),uniformData.specularExponent) * uniformData.specularColor;
            }
            return vec4f(color,1.0);
        }
    }
    
    struct VertexUniforms {
        count: u32,
      };

      @group(0) @binding(0) var<uniform> vertex: VertexUniforms;
      @group(0) @binding(1) var<storage, read_write> normals: array<vec3f>;
      
      @compute @workgroup_size(64)
      fn invertNormals(@builtin(global_invocation_id) globalId : vec3u) {
        let index = globalId.x;
        if (index >= vertex.count) { return; }
        normals[index] = normals[index] * -1.0;
      }

    `;
