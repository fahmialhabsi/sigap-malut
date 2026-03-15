import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-kbj", element: <ListPage /> },
  { path: "/sek-kbj/new", element: <FormPage /> },
  { path: "/sek-kbj/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-kbj/:id", element: <DetailPage /> },
];
