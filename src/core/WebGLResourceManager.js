// src/core/WebGLResourceManager.js
class WebGLResourceManager {
  constructor(gl) {
    this.gl = gl;
    this.resources = {
      textures: new Set(),
      buffers: new Set(),
      programs: new Set(),
      framebuffers: new Set(),
      renderbuffers: new Set(),
      vertexArrays: new Set()
    };
  }

  trackTexture(texture) {
    this.resources.textures.add(texture);
    return texture;
  }

  trackBuffer(buffer) {
    this.resources.buffers.add(buffer);
    return buffer;
  }

  trackProgram(program) {
    this.resources.programs.add(program);
    return program;
  }

  trackFramebuffer(framebuffer) {
    this.resources.framebuffers.add(framebuffer);
    return framebuffer;
  }

  trackRenderbuffer(renderbuffer) {
    this.resources.renderbuffers.add(renderbuffer);
    return renderbuffer;
  }

  trackVertexArray(vertexArray) {
    this.resources.vertexArrays.add(vertexArray);
    return vertexArray;
  }

  createTexture() {
    const texture = this.gl.createTexture();
    return this.trackTexture(texture);
  }

  createBuffer() {
    const buffer = this.gl.createBuffer();
    return this.trackBuffer(buffer);
  }

  createProgram() {
    const program = this.gl.createProgram();
    return this.trackProgram(program);
  }

  createFramebuffer() {
    const framebuffer = this.gl.createFramebuffer();
    return this.trackFramebuffer(framebuffer);
  }

  createRenderbuffer() {
    const renderbuffer = this.gl.createRenderbuffer();
    return this.trackRenderbuffer(renderbuffer);
  }

  createVertexArray() {
    const vertexArray = this.gl.createVertexArray();
    return this.trackVertexArray(vertexArray);
  }

  deleteTexture(texture) {
    this.gl.deleteTexture(texture);
    this.resources.textures.delete(texture);
  }

  deleteBuffer(buffer) {
    this.gl.deleteBuffer(buffer);
    this.resources.buffers.delete(buffer);
  }

  deleteProgram(program) {
    this.gl.deleteProgram(program);
    this.resources.programs.delete(program);
  }

  deleteFramebuffer(framebuffer) {
    this.gl.deleteFramebuffer(framebuffer);
    this.resources.framebuffers.delete(framebuffer);
  }

  deleteRenderbuffer(renderbuffer) {
    this.gl.deleteRenderbuffer(renderbuffer);
    this.resources.renderbuffers.delete(renderbuffer);
  }

  deleteVertexArray(vertexArray) {
    this.gl.deleteVertexArray(vertexArray);
    this.resources.vertexArrays.delete(vertexArray);
  }

  disposeAll() {
    // Delete all tracked resources
    this.resources.textures.forEach(texture => {
      this.gl.deleteTexture(texture);
    });

    this.resources.buffers.forEach(buffer => {
      this.gl.deleteBuffer(buffer);
    });

    this.resources.programs.forEach(program => {
      this.gl.deleteProgram(program);
    });

    this.resources.framebuffers.forEach(framebuffer => {
      this.gl.deleteFramebuffer(framebuffer);
    });

    this.resources.renderbuffers.forEach(renderbuffer => {
      this.gl.deleteRenderbuffer(renderbuffer);
    });

    if (this.resources.vertexArrays.size > 0) {
      this.resources.vertexArrays.forEach(vertexArray => {
        this.gl.deleteVertexArray(vertexArray);
      });
    }

    // Clear all sets
    Object.values(this.resources).forEach(set => set.clear());
  }

  getResourceCount() {
    return {
      textures: this.resources.textures.size,
      buffers: this.resources.buffers.size,
      programs: this.resources.programs.size,
      framebuffers: this.resources.framebuffers.size,
      renderbuffers: this.resources.renderbuffers.size,
      vertexArrays: this.resources.vertexArrays.size,
      total: Object.values(this.resources).reduce((sum, set) => sum + set.size, 0)
    };
  }
}

export default WebGLResourceManager;