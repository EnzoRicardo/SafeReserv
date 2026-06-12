import base64
import json
from pathlib import Path

from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad

KEYS_DIR = Path(__file__).resolve().parent.parent / "keys"


def _ensure_keys():
    KEYS_DIR.mkdir(exist_ok=True)
    private_path = KEYS_DIR / "private.pem"
    public_path = KEYS_DIR / "public.pem"

    if not private_path.exists():
        key = RSA.generate(2048)
        private_path.write_bytes(key.export_key())
        public_path.write_bytes(key.publickey().export_key())

    return private_path, public_path


def get_public_key_pem() -> str:
    _, public_path = _ensure_keys()
    return public_path.read_text()


def hybrid_encrypt(plaintext: str) -> tuple[str, str]:
    """Cifra o dado com AES e protege a chave simétrica com RSA (OAEP)."""
    aes_key = get_random_bytes(32)
    cipher_aes = AES.new(aes_key, AES.MODE_CBC)
    ciphertext = cipher_aes.encrypt(pad(plaintext.encode("utf-8"), AES.block_size))
    encrypted_data = base64.b64encode(cipher_aes.iv + ciphertext).decode("utf-8")

    _, public_path = _ensure_keys()
    public_key = RSA.import_key(public_path.read_bytes())
    cipher_rsa = PKCS1_OAEP.new(public_key)
    wrapped_key = base64.b64encode(cipher_rsa.encrypt(aes_key)).decode("utf-8")

    return encrypted_data, wrapped_key


def hybrid_decrypt(encrypted_data_b64: str, wrapped_key_b64: str) -> str:
    """Descriptografa a chave AES com RSA e depois o dado sensível."""
    private_path, _ = _ensure_keys()
    private_key = RSA.import_key(private_path.read_bytes())
    cipher_rsa = PKCS1_OAEP.new(private_key)
    aes_key = cipher_rsa.decrypt(base64.b64decode(wrapped_key_b64))

    raw = base64.b64decode(encrypted_data_b64)
    iv, ciphertext = raw[:16], raw[16:]
    cipher_aes = AES.new(aes_key, AES.MODE_CBC, iv=iv)
    plaintext = unpad(cipher_aes.decrypt(ciphertext), AES.block_size)
    return plaintext.decode("utf-8")


def encrypt_sensitive_reservation_data(participants_count: int) -> tuple[str, str]:
    payload = json.dumps({"participants_count": participants_count})
    return hybrid_encrypt(payload)


def decrypt_sensitive_reservation_data(encrypted_details: str, wrapped_key: str) -> dict:
    return json.loads(hybrid_decrypt(encrypted_details, wrapped_key))
