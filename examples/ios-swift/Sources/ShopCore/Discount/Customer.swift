import Foundation

public enum Tier: String, Codable {
    case regular = "REGULAR"
    case silver = "SILVER"
    case gold = "GOLD"
    case platinum = "PLATINUM"
}

public struct Customer: Codable, Equatable {
    public let id: String
    public let name: String
    public let tier: Tier
    public let ordersLastYear: Int

    public init(id: String, name: String, tier: Tier, ordersLastYear: Int) {
        self.id = id
        self.name = name
        self.tier = tier
        self.ordersLastYear = ordersLastYear
    }
}
