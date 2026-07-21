import AppKit
import Foundation

let sourcePath = "/Users/king/code/video-audit/current-evidence/01-0008.9s.png"
let destinationPath = "/Users/king/code/ai-math-coach-demo/assets/competitor/sample-camera-photo.png"

guard
    let source = NSImage(contentsOfFile: sourcePath),
    let sourceData = source.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: sourceData),
    let sourceCG = bitmap.cgImage
else {
    fatalError("Could not load source image")
}

let sourceScale = CGFloat(sourceCG.width) / 592
let phoneX = CGFloat(0) * sourceScale
let phoneTop = CGFloat(129) * sourceScale
let phoneWidth = CGFloat(592) * sourceScale
let cameraHeight = CGFloat(883) * sourceScale
let cropRect = CGRect(
    x: phoneX,
    y: phoneTop,
    width: phoneWidth,
    height: cameraHeight
)

guard
    let cropped = sourceCG.cropping(to: cropRect),
    let png = NSBitmapImageRep(cgImage: cropped).representation(using: .png, properties: [:])
else {
    fatalError("Could not crop source image")
}

try png.write(to: URL(fileURLWithPath: destinationPath))
print("Wrote \(destinationPath)")
