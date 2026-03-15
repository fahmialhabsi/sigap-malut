import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/upt-tkn", element: <ListPage /> },
  { path: "/upt-tkn/new", element: <FormPage /> },
  { path: "/upt-tkn/edit/:id", element: <FormPage isEdit /> },
  { path: "/upt-tkn/:id", element: <DetailPage /> },
];
