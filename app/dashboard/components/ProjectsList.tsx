import { Project } from "@prisma/client";

interface Props {
  projects: (Project & { tasks: { id: string }[] })[];
}

export default function ProjectsList({ projects }: Props) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Mis Proyectos</h2>
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id} className="p-4 border rounded">
            <span className="font-bold">{project.name}</span> -{" "}
            {project.tasks.length} tareas
          </li>
        ))}
      </ul>
    </section>
  );
}
