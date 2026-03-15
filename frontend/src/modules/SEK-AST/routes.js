import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-ast", element: <ListPage /> },
  { path: "/sek-ast/new", element: <FormPage /> },
  { path: "/sek-ast/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-ast/:id", element: <DetailPage /> },
];
