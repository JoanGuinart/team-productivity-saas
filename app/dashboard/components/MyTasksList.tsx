import { Task } from "@prisma/client";

interface Props {
  tasks: (Task & { project: { name: string } })[];
}

export default function MyTasksList({ tasks }: Props) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Mis Tareas</h2>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="p-4 border rounded flex justify-between">
            <div>
              <span className="font-bold">{task.title}</span>{" "}
              <span className="text-sm text-gray-500">
                ({task.project.name})
              </span>
            </div>
            <div className="text-sm text-gray-700">{task.status}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
