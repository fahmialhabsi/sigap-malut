import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/upt-ast", element: <ListPage /> },
  { path: "/upt-ast/new", element: <FormPage /> },
  { path: "/upt-ast/edit/:id", element: <FormPage isEdit /> },
  { path: "/upt-ast/:id", element: <DetailPage /> },
];
