// notchprobe — measures the display cutout and prints one line of JSON.
//
// Electron knows the menu bar's height and nothing about its hole. Guessing the
// cutout's width costs either dead black beside it or text hidden behind it.
// AppKit knows exactly: auxiliaryTopLeftArea and auxiliaryTopRightArea are the
// usable menu bar strips either side, so whatever lies between them is the
// cutout.
//
// Exits 0 either way. `"notch": false` means the caller should fall back to its
// configured width, not that something went wrong.
//
//   swiftc -O -o notchprobe notchprobe.swift

import AppKit

func auxAreas(_ s: NSScreen) -> (NSRect, NSRect)? {
    if #available(macOS 12.0, *), let l = s.auxiliaryTopLeftArea, let r = s.auxiliaryTopRightArea {
        return (l, r)
    }
    return nil
}

func isBuiltin(_ s: NSScreen) -> Bool {
    guard let n = s.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? NSNumber else { return false }
    return CGDisplayIsBuiltin(CGDirectDisplayID(n.uint32Value)) != 0
}

func menuBarHeight(_ s: NSScreen) -> CGFloat {
    s.frame.height - s.visibleFrame.height - (s.visibleFrame.origin.y - s.frame.origin.y)
}

let screens = NSScreen.screens

guard !screens.isEmpty else {
    print("{\"notch\":false,\"builtin\":false}")
    exit(0)
}

// Ask every screen, not only the one at the origin. Which display macOS calls
// primary is a user preference, not a fact about the hardware — dock a MacBook
// to an external monitor and the origin screen is the one without a cutout.
if let s = screens.first(where: { auxAreas($0) != nil }), let (left, right) = auxAreas(s) {
    let full = s.frame.width
    let topInset = s.safeAreaInsets.top
    let notchW = full - left.width - right.width
    let notchH = topInset > 0 ? topInset : left.height
    print(
        "{\"notch\":true,\"notchW\":\(notchW),\"notchH\":\(notchH),"
            + "\"screenW\":\(full),\"menuBarH\":\(menuBarHeight(s)),\"builtin\":true}"
    )
} else {
    // No cutout on anything attached. With the lid shut the built-in display is
    // not in NSScreen.screens at all, so this may be a notched MacBook that
    // simply cannot be measured right now — `builtin` keeps those apart.
    let builtin = screens.contains(where: isBuiltin)
    let s = screens.first(where: { $0.frame.origin == .zero }) ?? screens[0]
    print(
        "{\"notch\":false,\"builtin\":\(builtin),\"screenW\":\(s.frame.width),"
            + "\"menuBarH\":\(menuBarHeight(s))}"
    )
}
