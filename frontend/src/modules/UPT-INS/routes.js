import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/upt-ins", element: <ListPage /> },
  { path: "/upt-ins/new", element: <FormPage /> },
  { path: "/upt-ins/edit/:id", element: <FormPage isEdit /> },
  { path: "/upt-ins/:id", element: <DetailPage /> },
];
