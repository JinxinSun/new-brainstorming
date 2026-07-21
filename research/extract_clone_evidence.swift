import AVFoundation
import AppKit
import Foundation

let input = "/private/tmp/competitor_math_followup/competitor.mp4"
let outputDir = "/Users/king/code/video-audit/current-evidence"
let times: [Double] = [
    8.9, 17.9, 27.5, 37.6, 42.9, 47.7, 50.9, 59.2,
    69.9, 74.3, 79.4, 89.0, 98.5, 102.9, 113.6, 117.3,
]

try FileManager.default.createDirectory(
    at: URL(fileURLWithPath: outputDir),
    withIntermediateDirectories: true
)

let asset = AVURLAsset(url: URL(fileURLWithPath: input))
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = CMTime(seconds: 0.04, preferredTimescale: 600)
generator.requestedTimeToleranceAfter = CMTime(seconds: 0.04, preferredTimescale: 600)

for (index, seconds) in times.enumerated() {
    let requested = CMTime(seconds: seconds, preferredTimescale: 600)
    var actual = CMTime.zero
    let image = try generator.copyCGImage(at: requested, actualTime: &actual)
    let bitmap = NSBitmapImageRep(cgImage: image)
    guard let data = bitmap.representation(using: .png, properties: [:]) else {
        fatalError("Could not encode frame at \(seconds)s")
    }
    let name = String(format: "%02d-%06.1fs.png", index + 1, seconds)
    let destination = URL(fileURLWithPath: outputDir).appendingPathComponent(name)
    try data.write(to: destination)
    print(String(format: "%02d  %6.1fs -> %6.3fs  %@", index + 1, seconds, CMTimeGetSeconds(actual), name))
}
