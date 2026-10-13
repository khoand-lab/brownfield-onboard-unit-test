// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "Shop",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "ShopCore", targets: ["ShopCore"]),
    ],
    targets: [
        .target(name: "ShopCore"),
        .testTarget(name: "ShopCoreTests", dependencies: ["ShopCore"]),
    ]
)
