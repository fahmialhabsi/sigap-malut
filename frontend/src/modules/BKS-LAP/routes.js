import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bks-lap", element: <ListPage /> },
  { path: "/bks-lap/new", element: <FormPage /> },
  { path: "/bks-lap/edit/:id", element: <FormPage isEdit /> },
  { path: "/bks-lap/:id", element: <DetailPage /> },
];
