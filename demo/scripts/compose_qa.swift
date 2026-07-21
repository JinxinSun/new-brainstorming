import AppKit
import Foundation

guard CommandLine.arguments.count == 4 else {
    fputs("usage: compose_qa <reference.png> <implementation.png> <output.png>\n", stderr)
    exit(2)
}

let referencePath = CommandLine.arguments[1]
let implementationPath = CommandLine.arguments[2]
let outputPath = CommandLine.arguments[3]

guard let reference = NSImage(contentsOfFile: referencePath),
      let implementation = NSImage(contentsOfFile: implementationPath) else {
    fputs("could not load comparison images\n", stderr)
    exit(3)
}

let panelWidth = 390
let panelHeight = 844
let labelHeight = 34
let gutter = 16
let canvasWidth = panelWidth * 2 + gutter
let canvasHeight = panelHeight + labelHeight

guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: canvasWidth,
    pixelsHigh: canvasHeight,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: canvasWidth * 4,
    bitsPerPixel: 32
) else {
    exit(4)
}

NSGraphicsContext.saveGraphicsState()
guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else { exit(5) }
NSGraphicsContext.current = context

NSColor(calibratedWhite: 0.93, alpha: 1).setFill()
NSRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight).fill()

let referenceRect = NSRect(x: 0, y: 0, width: panelWidth, height: panelHeight)
let implementationRect = NSRect(x: panelWidth + gutter, y: 0, width: panelWidth, height: panelHeight)
reference.draw(in: referenceRect, from: .zero, operation: .copy, fraction: 1)
implementation.draw(in: implementationRect, from: .zero, operation: .copy, fraction: 1)

let paragraph = NSMutableParagraphStyle()
paragraph.alignment = .center
let attributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: 14, weight: .semibold),
    .foregroundColor: NSColor(calibratedWhite: 0.18, alpha: 1),
    .paragraphStyle: paragraph,
]

("竞品原视频" as NSString).draw(
    in: NSRect(x: 0, y: panelHeight + 8, width: panelWidth, height: 20),
    withAttributes: attributes
)
("复刻 Demo" as NSString).draw(
    in: NSRect(x: panelWidth + gutter, y: panelHeight + 8, width: panelWidth, height: 20),
    withAttributes: attributes
)

context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()

guard let png = bitmap.representation(using: .png, properties: [:]) else { exit(6) }
try png.write(to: URL(fileURLWithPath: outputPath))
