import React from "react";
import moment from "moment";
import calculateDuration from "../lib/calculate-duration";

const MeetingMiniInfo: React.FC<{
  duration: number,
  subject: string,
  time: Date,
  date: Date,
}> = ({ duration, subject, time, date }) => {
  const endTime = calculateDuration(time, duration);

  return (
    <>
      <p>
        <strong>Subject: </strong>{subject}
      </p>
      <p className="ion-no-margin">
        <small>Date: <strong>
          {moment(date).format("MMM Do YYYY")}
        </strong></small>
      </p>
      <p className="ion-no-margin">
        <small>Time: <strong>
          {moment(time).format("LT")} - {moment(endTime).format("LT")}
        </strong></small>
      </p>
    </>
  );
};

export default MeetingMiniInfo;