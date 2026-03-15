import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bks-bmb", element: <ListPage /> },
  { path: "/bks-bmb/new", element: <FormPage /> },
  { path: "/bks-bmb/edit/:id", element: <FormPage isEdit /> },
  { path: "/bks-bmb/:id", element: <DetailPage /> },
];
