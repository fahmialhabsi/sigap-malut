import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bkt-bmb", element: <ListPage /> },
  { path: "/bkt-bmb/new", element: <FormPage /> },
  { path: "/bkt-bmb/edit/:id", element: <FormPage isEdit /> },
  { path: "/bkt-bmb/:id", element: <DetailPage /> },
];
