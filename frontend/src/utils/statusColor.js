export function statusColor(status) {

  switch (status) {

    case "ATIVO":
      return "bg-green-100 text-green-700";

    case "INATIVO":
      return "bg-gray-100 text-gray-700";

    case "PENDENTE":
      return "bg-yellow-100 text-yellow-700";

    case "ATRASADO":
      return "bg-red-100 text-red-700";

    case "CANCELADO":
      return "bg-gray-200 text-gray-800";

    default:
      return "bg-blue-100 text-blue-700";

  }

}