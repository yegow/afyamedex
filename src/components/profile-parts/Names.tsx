import React from "react";
import { IonText } from "@ionic/react";

import { PartProps } from "./Bio";

const Names: React.FC<PartProps> = ({ user }) => {
  return (
    <h4>
      <span className="ion-text-capitalize">
        {user.fullName}
      </span><br />
      <IonText color="medium"><small>@{user.username}</small></IonText>
    </h4>
  )
};

export default Names;