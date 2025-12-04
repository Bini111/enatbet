#!/bin/bash

# 1. Fix UIDevice.swift
cat > node_modules/expo-device/ios/UIDevice.swift << 'EOF1'
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
      if fileManager.fileExists(atPath: "/Applications/Cydia.app") {
        return true
      }
      return false
    #endif
  }
  
  static var modelIdentifier: String {
    return UIDevice.current.modelName
  }
  
  static var DeviceMap: (modelName: String, deviceYearClass: Int?) {
    let model = UIDevice.current.modelName
    return (modelName: model, deviceYearClass: nil)
  }
}
EOF1

echo "✅ Patched UIDevice.swift"

# 2. Fix DeviceModule.swift  
cat > node_modules/expo-device/ios/DeviceModule.swift << 'EOF2'
import ExpoModulesCore
import UIKit

public class DeviceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoDevice")

    Constants {
      let deviceMap = UIDevice.DeviceMap
      return [
        "brand": "Apple",
        "manufacturer": "Apple",
        "modelId": UIDevice.modelIdentifier,
        "modelName": deviceMap.modelName,
        "deviceYearClass": deviceMap.deviceYearClass as Any,
        "totalMemory": ProcessInfo.processInfo.physicalMemory,
        "osName": UIDevice.current.systemName,
        "osVersion": UIDevice.current.systemVersion,
        "osBuildId": UIDevice.current.systemVersion,
        "osInternalBuildId": UIDevice.current.systemVersion,
        "supportedCpuArchitectures": getSupportedCpuArchitectures(),
        "platformApiLevel": nil,
        "deviceName": UIDevice.current.name
      ]
    }

    AsyncFunction("isRootedExperimentalAsync") {
      return UIDevice.current.isJailbroken
    }

    AsyncFunction("isPlatformApiLevelAtLeastAsync") { (platformApiLevel: Int) in
      return true
    }
  }

  private func getSupportedCpuArchitectures() -> [String] {
    var supportedArchitectures: [String] = []
    #if arch(arm64)
      supportedArchitectures.append("arm64")
    #elseif arch(x86_64)
      supportedArchitectures.append("x86_64")
    #elseif arch(arm)
      supportedArchitectures.append("arm")
    #endif
    return supportedArchitectures
  }
}
EOF2

echo "✅ Patched DeviceModule.swift"
