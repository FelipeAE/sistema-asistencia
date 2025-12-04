"""
Script para crear el primer usuario administrador
"""
import sys
from pathlib import Path
from getpass import getpass

# Añadir el directorio backend al path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.database import SessionLocal
from app.models.admin_user import AdminUser
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_admin():
    """Crear el primer usuario administrador"""
    print("[*] Crear Usuario Administrador")
    print("-" * 40)

    username = input("Nombre de usuario: ").strip()
    if not username:
        print("[ERROR] El nombre de usuario no puede estar vacio")
        return

    nombre_completo = input("Nombre completo: ").strip()

    password = getpass("Contrasena: ")
    if len(password) < 6:
        print("[ERROR] La contrasena debe tener al menos 6 caracteres")
        return

    password_confirm = getpass("Confirmar contrasena: ")
    if password != password_confirm:
        print("[ERROR] Las contrasenas no coinciden")
        return

    # Crear sesión de base de datos
    db = SessionLocal()

    try:
        # Verificar si el usuario ya existe
        existing = db.query(AdminUser).filter(AdminUser.username == username).first()
        if existing:
            print(f"[ERROR] El usuario '{username}' ya existe")
            return

        # Hash de la contraseña
        password_hash = pwd_context.hash(password)

        # Crear usuario
        admin = AdminUser(
            username=username,
            password_hash=password_hash,
            nombre_completo=nombre_completo,
            rol="super_admin",
            activo=True
        )

        db.add(admin)
        db.commit()

        print("\n[OK] Usuario administrador creado exitosamente")
        print(f"   Usuario: {username}")
        print(f"   Nombre: {nombre_completo}")
        print(f"   Rol: super_admin")

    except Exception as e:
        print(f"[ERROR] Error al crear usuario: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
