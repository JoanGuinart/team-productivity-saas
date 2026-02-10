import { Project } from "@prisma/client";

interface Props {
  projects: (Project & { tasks: { id: string }[] })[];
}

export default function ProjectsList({ projects }: Props) {
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Mis Proyectos</h2>
      <ul className="space-y-3">
        {projects.map((project) => (
          <li key={project.id} className="p-3 sm:p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="font-bold text-base sm:text-lg">{project.name}</span>
              <span className="text-sm text-gray-600">{project.tasks.length} tareas</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
