import AppKit
import Foundation

let sourcePath = "/Users/king/code/video-audit/current-evidence/05-0042.9s.png"
let destinationPath = "/Users/king/code/ai-math-coach-demo/assets/competitor/teacher-avatar-source.png"

guard
    let source = NSImage(contentsOfFile: sourcePath),
    let sourceData = source.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: sourceData),
    let sourceCG = bitmap.cgImage,
    let cropped = sourceCG.cropping(to: CGRect(x: 64, y: 679, width: 78, height: 78)),
    let png = NSBitmapImageRep(cgImage: cropped).representation(using: .png, properties: [:])
else {
    fatalError("Could not crop the teacher avatar")
}

try png.write(to: URL(fileURLWithPath: destinationPath))
print("Wrote \(destinationPath)")
