from nanoid import generate

def genID(size = 6):
    return generate('123456789abcdefABCDEF', size)