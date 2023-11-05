class BookMesh
{
	constructor (angle_in_degrees) {
		const indices = [];
		const vertices = [];
		const normals = [];
		const texCoords = [];

		const page_length = 5;
		const page_width = 3;
		const angle_in_radians = angle_in_degrees * Math.PI/180;
		const max_height = 1;

		const direction = (angle_in_degrees > 90) ? -1 : 1;
		const length_segment_count = 10;
		const length_segment_size = page_length / length_segment_count;

		// generate vertices and normals for the curved planar surface
		const length_curved_part = direction * max_height * (Math.PI/2 - angle_in_radians);
		const curved_part_segment_count = 25;
		const curved_part_segment_size = length_curved_part/curved_part_segment_count;

		let x, y, z, l, c, s;
		for ( let i = 0; i <= curved_part_segment_count; i ++ ) {
			l = ( i * curved_part_segment_size ) / max_height;
			c = Math.cos(l);
			s = Math.sin(l);
			x = direction * max_height * (1 - c);
			y = max_height * s;

			for ( let j = 0; j <= length_segment_count; j ++ ) {
				z = ( j * length_segment_size ) - page_length/2;

				vertices.push( x, y, z );
				normals.push( -c , s * direction, 0 );
			}
		}

		// generate vertices and normals for the flat planar surface
		const x_start = x;
		const y_start = y;
		const length_flat_part = page_width - length_curved_part;
		const flat_part_segment_count = 5;
		const flat_part_segment_size = length_flat_part / flat_part_segment_count;

		for ( let i = 1; i <= flat_part_segment_count; i ++ ) {
			l = ( i * flat_part_segment_size );
			x = x_start + l * s * direction;
			y = y_start + l * c;

			for ( let j = 0; j <= length_segment_count; j ++ ) {
				z = ( j * length_segment_size ) - page_length/2;

				vertices.push( x, y, z );
				normals.push(  -c   , s * direction , 0 );
			}
		}

		// generate indices (data for element array buffer)
		const width_segment_count = (curved_part_segment_count + flat_part_segment_count);
		for ( let i = 0; i < width_segment_count; i ++ ) {

			for ( let j = 0; j < length_segment_count; j ++ ) {

			const a = i * ( length_segment_count + 1 ) + ( j + 1 );
				const b = i * ( length_segment_count + 1 ) + j;
				const c = ( i + 1 ) * ( length_segment_count + 1 ) + j;
				const d = ( i + 1 ) * ( length_segment_count + 1 ) + ( j + 1 );

				// generate two faces (triangles) per iteration
				indices.push(a, d, b); // face one
				texCoords.push(0,0,1,0,1,1,0,1);
				indices.push(b, d, c); // face two
				texCoords.push(0,0,1,0,1,1,0,1);
			}
		}

	return {
		vertexPositions: new Float32Array(vertices),
		vertexNormals: new Float32Array(normals),
		vertexTextureCoords: new Float32Array(texCoords),
		indices: new Uint16Array(indices)
	};
	}
}