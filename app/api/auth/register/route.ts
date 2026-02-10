import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, name, password, adminPassword } = await req.json();

    // Validar contraseña de admin
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Contraseña de administrador inválida" }),
        { status: 403 },
      );
    }

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email y password son requeridos" }),
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Usuario ya registrado" }), {
        status: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return new Response(
      JSON.stringify({ id: user.id, email: user.email, name: user.name }),
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
}
