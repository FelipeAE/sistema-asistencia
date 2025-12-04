"""
Script simple para crear usuario admin por defecto
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.database import SessionLocal
from app.models.admin_user import AdminUser
import bcrypt


def create_default_admin():
    """Crear usuario admin por defecto"""
    db = SessionLocal()
    
    try:
        # Verificar si ya existe
        existing = db.query(AdminUser).filter(AdminUser.username == "admin").first()
        if existing:
            print("[OK] Usuario 'admin' ya existe")
            return

        # Crear usuario admin/admin
        password_hash = bcrypt.hashpw("admin".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        admin = AdminUser(
            username="admin",
            password_hash=password_hash,
            nombre_completo="Administrador Principal",
            rol="super_admin",
            activo=True
        )

        db.add(admin)
        db.commit()

        print("[OK] Usuario administrador creado:")
        print("   Usuario: admin")
        print("   Contrasena: admin")
        print("   [WARN] Cambiar contrasena en produccion")

    except Exception as e:
        print(f"[ERROR] Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_default_admin()
