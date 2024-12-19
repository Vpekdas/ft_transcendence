def make_id(k=8) -> str:
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=k))

def hash_weak_password(s) -> str:
    return hashlib.sha256("salty$" + s).hexdigest()
