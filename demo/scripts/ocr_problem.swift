import AppKit
import Foundation
import Vision

guard CommandLine.arguments.count > 1 else {
    fputs("Missing image path\n", stderr)
    exit(2)
}

let imagePath = CommandLine.arguments[1]
guard
    let image = NSImage(contentsOfFile: imagePath),
    let imageData = image.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: imageData),
    let cgImage = bitmap.cgImage
else {
    fputs("Could not decode image\n", stderr)
    exit(3)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.recognitionLanguages = ["zh-Hans", "en-US"]
request.usesLanguageCorrection = true
request.minimumTextHeight = 0.012

let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
try handler.perform([request])

let observations = (request.results ?? []).sorted { first, second in
    let yDifference = abs(first.boundingBox.midY - second.boundingBox.midY)
    if yDifference > 0.018 {
        return first.boundingBox.midY > second.boundingBox.midY
    }
    return first.boundingBox.minX < second.boundingBox.minX
}

let lines = observations.compactMap { observation in
    observation.topCandidates(1).first?.string.trimmingCharacters(in: .whitespacesAndNewlines)
}.filter { !$0.isEmpty }

print(lines.joined(separator: "\n"))
