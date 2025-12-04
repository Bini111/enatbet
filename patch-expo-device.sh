#!/bin/bash

# Fix UIDevice.swift for Xcode 16
cat > node_modules/expo-device/ios/UIDevice.swift << 'SWIFTCODE'
import UIKit

public extension UIDevice {
  var modelName: String {
    #if targetEnvironment(simulator)
      let identifier = ProcessInfo().environment["SIMULATOR_MODEL_IDENTIFIER"]!
      return identifier
    #else
      var systemInfo = utsname()
      uname(&systemInfo)
      let machineMirror = Mirror(reflecting: systemInfo.machine)
      let identifier = machineMirror.children.reduce("") { identifier, element in
        guard let value = element.value as? Int8, value != 0 else { return identifier }
        return identifier + String(UnicodeScalar(UInt8(value)))
      }
      return identifier
    #endif
  }

  var isSimulator: Bool {
    #if targetEnvironment(simulator)
      return true
    #else
      return false
    #endif
  }

  var isJailbroken: Bool {
    #if targetEnvironment(simulator)
      return false
    #else
      let fileManager = FileManager.default
      if fileManager.fileExists(atPath: "/Applications/Cydia.app") ||
         fileManager.fileExists(atPath: "/Library/MobileSubstrate/MobileSubstrate.dylib") ||
         fileManager.fileExists(atPath: "/bin/bash") ||
         fileManager.fileExists(atPath: "/usr/sbin/sshd") ||
         fileManager.fileExists(atPath: "/etc/apt") ||
         fileManager.fileExists(atPath: "/private/var/lib/apt/") {
        return true
      }
      
      if let cydiaUrlScheme = URL(string: "cydia://package/com.example.package") {
        if UIApplication.shared.canOpenURL(cydiaUrlScheme) {
          return true
        }
      }
      
      return false
    #endif
  }
  
  static var modelIdentifier: String {
    return UIDevice.current.modelName
  }
}
SWIFTCODE

echo "✅ Patched UIDevice.swift"
