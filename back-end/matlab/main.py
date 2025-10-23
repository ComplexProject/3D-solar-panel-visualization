import subprocess

def main():
    result = subprocess.run(
        ["octave", "add_numbers.m","5","2"], 
        capture_output=True, 
        text=True)
    print(result.stdout)

if __name__ == "__main__":
    main()
