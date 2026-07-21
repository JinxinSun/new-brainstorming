import AVFoundation
import AppKit
import Foundation

let input = "/private/tmp/competitor_math_followup/competitor.mp4"
let outputDir = "/Users/king/code/video-audit/frames"
let times: [Double] = [0.5, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115]

try FileManager.default.createDirectory(
    at: URL(fileURLWithPath: outputDir),
    withIntermediateDirectories: true
)

let asset = AVURLAsset(url: URL(fileURLWithPath: input))
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = CMTime(seconds: 0.1, preferredTimescale: 600)
generator.requestedTimeToleranceAfter = CMTime(seconds: 0.1, preferredTimescale: 600)

for seconds in times {
    let requested = CMTime(seconds: seconds, preferredTimescale: 600)
    var actual = CMTime.zero
    do {
        let image = try generator.copyCGImage(at: requested, actualTime: &actual)
        let bitmap = NSBitmapImageRep(cgImage: image)
        guard let data = bitmap.representation(using: .png, properties: [:]) else {
            print("Could not encode frame at \(seconds)s")
            continue
        }
        let name = String(format: "frame-%06.1f.png", seconds)
        let destination = URL(fileURLWithPath: outputDir).appendingPathComponent(name)
        try data.write(to: destination)
        print(String(format: "%6.1fs -> %6.3fs  %@", seconds, CMTimeGetSeconds(actual), name))
    } catch {
        print("Failed at \(seconds)s: \(error)")
    }
}
