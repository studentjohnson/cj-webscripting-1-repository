class LCG:
    def __init__(self, seed):
        self.modulus = 2**32
        self.a = 1103515245
        self.c = 12345
        self.state = seed

    def randint(self, lower, upper):
        self.state = (self.a * self.state + self.c) % self.modulus
        return lower + (self.state % (upper - lower + 1))


def roll_dice(num_dice, num_sides, rng):
    results = [rng.randint(1, num_sides) for _ in range(num_dice)]
    return results


def main():
    dice_options = {
        '1': 4,
        '2': 6,
        '3': 8,
        '4': 10,
        '5': 12,
        '6': 20,
        '7': 100
    }

    seed = 12345678  # You can use any seed value you like
    rng = LCG(seed)

    while True:
        print("Select the type of dice to roll:")
        print("1. D4")
        print("2. D6")
        print("3. D8")
        print("4. D10")
        print("5. D12")
        print("6. D20")
        print("7. D100")
        print("8. Quit")

        choice = input("Enter your choice (1-8): ")

        if choice == '8':
            print("Exiting the dice roller. Goodbye!")
            break
        elif choice in dice_options:
            num_sides = dice_options[choice]
            num_dice = int(input(f"Enter the number of D{num_sides} dice to roll: "))
            results = roll_dice(num_dice, num_sides, rng)
            print(f"Rolling {num_dice} D{num_sides} dice: {results}")
            print(f"Total: {sum(results)}")
        else:
            print("Invalid choice. Please select a valid option.")


if __name__ == "__main__":
    main()
