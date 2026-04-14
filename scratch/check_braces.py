
with open('src/pages/Projects.tsx', 'r') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    for char in line:
        if char == '{':
            stack.append(i + 1)
        elif char == '}':
            if not stack:
                print(f"Extra '}}' at line {i + 1}")
            else:
                stack.pop()

if stack:
    print(f"Unclosed '{{' from lines: {stack}")
else:
    print("Braces are balanced (ignoring strings/comments)")
