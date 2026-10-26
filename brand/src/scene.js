// The Darb Sennin mark in 3D: one open gold ensō around ivory code braces, on dark forest paper.
// Procedural and seeded, so every render of a variant is identical.
//
// createScene({ canvas, w, h, variant, scale, tokens, font }) -> { render() }
//   variant 'tile'  the mark fills the square, for app icons (scale = share of the frame the ensō fills)
//   variant 'og'    wide social card, mark on the right (copy is drawn by the page)
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { ensoPoint, ensoWidth } from './enso.js'

export async function createScene({ canvas, w, h, variant = 'tile', scale = 0.62, tokens, font }) {
  const R = tokens.render, E = tokens.enso
  const C = Object.fromEntries(Object.entries(tokens.color).map(([k, v]) => [k, new THREE.Color(v.hex)]))
  const og = variant === 'og'

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true })
  renderer.setSize(w, h, false)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = R.exposure
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = R.environment

  let seed = R.seed
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647

  // dark forest paper with fine fibres, fading to night at the edges
  const paper = (() => {
    const n = 1024, cv = document.createElement('canvas'); cv.width = cv.height = n
    const g = cv.getContext('2d')
    g.fillStyle = '#' + C.forest.clone().multiplyScalar(0.55).getHexString(); g.fillRect(0, 0, n, n)
    for (let i = 0; i < 22000; i++) {
      g.fillStyle = `rgba(${rnd() < .5 ? '0,0,0' : '230,245,236'},${rnd() * .06})`
      g.fillRect(rnd() * n, rnd() * n, 1 + rnd() * 3, 1 + rnd() * 2)
    }
    const v = g.createRadialGradient(n / 2, n / 2, n * 0.18, n / 2, n / 2, n * 0.62)
    v.addColorStop(0, 'rgba(3,17,12,0)'); v.addColorStop(1, 'rgba(3,17,12,.75)')
    g.fillStyle = v; g.fillRect(0, 0, n, n)
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
    return t
  })()
  const back = new THREE.Mesh(new THREE.PlaneGeometry(og ? 30 : 14, og ? 16 : 14), new THREE.MeshStandardMaterial({ map: paper, roughness: 0.95 }))
  back.position.z = -0.3; back.receiveShadow = true; scene.add(back)

  // the ensō: a tube along the brush path, each ring squeezed to the brush width, flatter in depth
  const steps = 400, radial = 24
  const curve = new THREE.CatmullRomCurve3(Array.from({ length: 201 }, (_, i) => {
    const t = i / 200, [x, y] = ensoPoint(E, t)
    return new THREE.Vector3(x, y, Math.sin((E.start + E.sweep * t) * 2) * 0.05)
  }))
  const tube = new THREE.TubeGeometry(curve, steps, 1, radial)
  const pos = tube.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.floor(i / (radial + 1)) / steps)
    const c = curve.getPointAt(t)
    const v = new THREE.Vector3().fromBufferAttribute(pos, i).sub(c).normalize().multiplyScalar(Math.max(ensoWidth(E, t), 0.004))
    v.z *= E.depth
    pos.setXYZ(i, c.x + v.x, c.y + v.y, c.z + v.z)
  }
  tube.computeVertexNormals()
  const gold = new THREE.MeshPhysicalMaterial({ color: C.gold, metalness: 1, roughness: 0.22, clearcoat: 0.5, clearcoatRoughness: 0.15 })
  const stroke = new THREE.Mesh(tube, gold); stroke.castShadow = true; scene.add(stroke)

  // the braces, in Geist, extruded in soft ivory
  const shapes = []
  const path = font.getPath(tokens.mark.glyph, 0, 0, 1000)
  const contours = []; let cur = null
  for (const c of path.commands) { if (c.type === 'M') contours.push((cur = [c])); else if (c.type !== 'Z') cur.push(c) }
  for (const cs of contours) {
    const s = new THREE.Shape()
    for (const c of cs) {
      if (c.type === 'M') s.moveTo(c.x, -c.y)
      else if (c.type === 'L') s.lineTo(c.x, -c.y)
      else if (c.type === 'Q') s.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y)
      else if (c.type === 'C') s.bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y)
    }
    shapes.push(s)
  }
  const bg = new THREE.ExtrudeGeometry(shapes, { depth: 150, bevelEnabled: true, bevelThickness: 14, bevelSize: 8, bevelSegments: 4, curveSegments: 10 })
  bg.computeBoundingBox(); const bb = bg.boundingBox
  const BR = 1.5
  bg.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, 0)
  bg.scale(BR / 1000, BR / 1000, BR / 1000)
  const braces = new THREE.Mesh(bg, new THREE.MeshPhysicalMaterial({ color: C.ivory.clone().multiplyScalar(0.62), roughness: 0.4, clearcoat: 0.4 }))
  braces.castShadow = true; scene.add(braces)

  const key = new THREE.DirectionalLight(C.goldLight, R.key)
  key.position.set(-3, 4, 7); key.castShadow = true
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 })
  scene.add(key)
  scene.add(new THREE.HemisphereLight(C.mist, C.night, 0.35))

  const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100)
  const fov = THREE.MathUtils.degToRad(camera.fov)
  const span = (E.radius + E.width) * 2
  const d = span / (og ? 0.62 : scale) / (2 * Math.tan(fov / 2))
  camera.position.set(d * 0.07, -d * 0.045, d); camera.lookAt(0, 0, 0)
  if (og) camera.setViewOffset(w, h, -w * 0.25, 0, w, h)
  camera.updateProjectionMatrix()

  const composer = new EffectComposer(renderer)
  composer.setSize(w, h)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), R.bloom.strength, R.bloom.radius, R.bloom.threshold))
  composer.addPass(new OutputPass())
  return { render: () => composer.render() }
}
