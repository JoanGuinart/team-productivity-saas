import { Task } from "@prisma/client";

interface Props {
  tasks: (Task & { project: { name: string } })[];
}

export default function MyTasksList({ tasks }: Props) {
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Mis Tareas</h2>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id} className="p-3 sm:p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <div className="flex-1">
                <span className="font-bold text-base">{task.title}</span>
                <span className="block sm:inline text-sm text-gray-500 sm:ml-2">
                  ({task.project.name})
                </span>
              </div>
              <div className="text-sm font-medium text-gray-700 self-start sm:self-center">
                {task.status}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
