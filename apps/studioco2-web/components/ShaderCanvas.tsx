'use client'

import { useEffect, useRef } from 'react'
import { driftShapes } from '@studioco2/lib/effects'
import type { Effects } from '@studioco2/lib/effects'
import { gridShader, vertexShader } from '@studioco2/lib/shaders'

type Props = { drift: Effects; mode: number; intensity: number; quiet: boolean; dark: boolean; onFailure: () => void }

export default function ShaderCanvas(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const latest = useRef(props)
  const invalidate = useRef<() => void>(() => {})
  useEffect(() => { latest.current = props; invalidate.current() }, [props])

  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, powerPreference: 'low-power' })
    if (!gl) { canvas.dataset.state = 'fallback'; latest.current.onFailure(); return }
    let alive = true
    let frame = 0
    let visible = true
    let elapsed = 0
    let last = 0
    let drawnAt = 0
    const pointer = { x: .5, y: .5, targetX: .5, targetY: .5 }
    const shaders: WebGLShader[] = []
    const program = gl.createProgram()!
    const buffer = gl.createBuffer()!

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      shaders.push(shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed')
      gl.attachShader(program, shader)
    }
    try {
      compile(gl.VERTEX_SHADER, vertexShader)
      compile(gl.FRAGMENT_SHADER, gridShader)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader linking failed')
    } catch (error) {
      console.warn('Shader fallback:', error)
      canvas.dataset.state = 'fallback'
      latest.current.onFailure()
      shaders.forEach(shader => gl.deleteShader(shader))
      gl.deleteProgram(program); gl.deleteBuffer(buffer)
      return
    }
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const uniform = Object.fromEntries(['resolution','pointer','time','intensity','mode','dark','size','speed','chaos','shape'].map(name => [name,gl.getUniformLocation(program,`u_${name}`)]))
    const draw = (now: number) => {
      frame = 0
      if (!alive || !visible || document.hidden || gl.isContextLost()) return
      const settings = latest.current
      const interval = innerWidth < 768 ? 1000/30 : 1000/45
      if (now-drawnAt >= interval || settings.quiet) {
        if (!settings.quiet && last) elapsed += Math.min((now-last)/1000,.05)
        last = now; drawnAt = now
        pointer.x += (pointer.targetX-pointer.x)*.08
        pointer.y += (pointer.targetY-pointer.y)*.08
        const box = canvas.getBoundingClientRect()
        gl.uniform2f(uniform.resolution,box.width,box.height)
        gl.uniform2f(uniform.pointer,settings.quiet ? .5 : pointer.x,settings.quiet ? .5 : pointer.y)
        gl.uniform1f(uniform.time,elapsed)
        gl.uniform1f(uniform.mode,settings.mode)
        gl.uniform1f(uniform.intensity,settings.intensity/100)
        gl.uniform1f(uniform.dark,settings.dark ? 1 : 0)
        gl.uniform1f(uniform.size,settings.drift.driftSize/100)
        gl.uniform1f(uniform.speed,settings.drift.driftSpeed/100)
        gl.uniform1f(uniform.chaos,settings.drift.driftChaos/100)
        gl.uniform1f(uniform.shape,driftShapes.indexOf(settings.drift.driftShape))
        gl.drawArrays(gl.TRIANGLES,0,6)
        canvas.dataset.state = settings.quiet ? 'paused' : 'running'
      }
      if (!settings.quiet) frame = requestAnimationFrame(draw)
    }
    const schedule = () => { if (!frame && alive && visible && !document.hidden) { last = 0; drawnAt = 0; frame = requestAnimationFrame(draw) } }
    invalidate.current = schedule
    const resize = () => {
      const box = canvas.getBoundingClientRect()
      const ratio = Math.min(devicePixelRatio,innerWidth < 768 ? 1 : 1.25)
      canvas.width = Math.round(box.width*ratio); canvas.height = Math.round(box.height*ratio)
      gl.viewport(0,0,canvas.width,canvas.height)
      schedule()
    }
    const move = (event: PointerEvent) => {
      if (latest.current.quiet || event.pointerType !== 'mouse' || !visible) return
      const box = canvas.getBoundingClientRect()
      pointer.targetX = Math.max(0,Math.min(1,(event.clientX-box.left)/box.width))
      pointer.targetY = Math.max(0,Math.min(1,(event.clientY-box.top)/box.height))
    }
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; canvas.dataset.state = 'suspended' }
      else schedule()
    }
    const lost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; canvas.dataset.state = 'fallback'; latest.current.onFailure() }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) schedule()
      else { cancelAnimationFrame(frame); frame = 0; canvas.dataset.state = 'suspended' }
    },{ rootMargin:'0px' })
    observer.observe(canvas)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    window.addEventListener('pointermove',move,{ passive:true })
    document.addEventListener('visibilitychange',visibility)
    canvas.addEventListener('webglcontextlost',lost)
    resize()

    return () => {
      alive = false; cancelAnimationFrame(frame); invalidate.current = () => {}
      observer.disconnect(); resizeObserver.disconnect()
      window.removeEventListener('pointermove',move)
      document.removeEventListener('visibilitychange',visibility)
      canvas.removeEventListener('webglcontextlost',lost)
      shaders.forEach(shader => gl.deleteShader(shader))
      gl.deleteProgram(program); gl.deleteBuffer(buffer)
    }
  }, [])
  return <canvas ref={canvasRef} className="shader-canvas shader-grid" aria-hidden="true" data-state="loading" />
}
