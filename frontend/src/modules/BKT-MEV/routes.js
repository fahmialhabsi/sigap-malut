import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bkt-mev", element: <ListPage /> },
  { path: "/bkt-mev/new", element: <FormPage /> },
  { path: "/bkt-mev/edit/:id", element: <FormPage isEdit /> },
  { path: "/bkt-mev/:id", element: <DetailPage /> },
];
