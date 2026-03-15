import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bks-dvr", element: <ListPage /> },
  { path: "/bks-dvr/new", element: <FormPage /> },
  { path: "/bks-dvr/edit/:id", element: <FormPage isEdit /> },
  { path: "/bks-dvr/:id", element: <DetailPage /> },
];
