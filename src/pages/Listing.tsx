import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonContent, IonPage, IonRow, IonCol, IonIcon, IonSearchbar, IonGrid, IonItem, IonLabel, IonAvatar, IonList, IonBadge, useIonViewDidEnter, useIonViewWillLeave, IonPopover } from '@ionic/react';
import { search, person, businessOutline, close, filter } from 'ionicons/icons';

import './Listing.css';
import { getUsers } from "../http/users";
import useToastManager from '../lib/toast-hook';
import LoadingFallback from '../components/LoadingFallback';
import { SPECIALITIES, USER } from '../http/constants';
import UserHeader from '../components/UserHeader';
import debounce from '../lib/debounce';
import useMounted from '../lib/mounted-hook';
import ErrorFallback from '../components/ErrorFallback';
import { useAppContext } from '../lib/context-lib';
import { ProfileData } from '../components/UserProfile';
import RatingInfo from '../components/RatingInfo';
import userPicture from '../http/helpers/user-picture';

const Listing: React.FC = () => {
  const ALL = "ALL";
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [isSearching, setSearching] = useState(false);
  let [professionals, setProfessionals] = useState<any[] | null>(null);
  const [viewItems, setViewItems] = useState([]);
  const [specialityFilter, setSpecialityFilter] = useState(ALL);
  const [loadError, setLoadError] = useState(false);
  const [listMargin, setListMargin] = useState(0);
  const { onError } = useToastManager();
  const { currentUser } = useAppContext() as any;
  const { isMounted, setMounted } = useMounted();

  const fetchProfessionals = async (opts?: any) => {
    setProfessionals(null);
    try {
      const { data } = await getUsers(currentUser.token, opts);
      isMounted && setProfessionals(data.filter(
        (user: ProfileData) => user._id !== currentUser._id)
      );
    } catch (error) {
      isMounted && setLoadError(true);
      onError(error.message);
    }
  };

  const openPopover = () => setShowPopover(true);
  const closePopover = () => setShowPopover(false);

  const filterHandlerFactory = (speciality: string) => () => {
    setSpecialityFilter(speciality);
    closePopover();
  };

  const onToggle = () => setShowSearchBar(!showSearchBar);
  const closeSearchBar = async () => {
    setShowSearchBar(false);
    await fetchProfessionals();
  };

  useEffect(() => {
    let items: any = professionals;
    if (specialityFilter !== ALL) {
      items = professionals?.filter(p => p.speciality === specialityFilter);
    }
    setViewItems(items);
  }, [professionals, specialityFilter]);

  useIonViewDidEnter(() => {
    setMounted(true);
    fetchProfessionals({});
  }, []);

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  return (
    <IonPage>
      <UserHeader title="Listing" secondary={
        <>
          <IonButton onClick={onToggle} color={showSearchBar ? "danger" : "dark"}>
            <IonIcon slot="icon-only" icon={showSearchBar ? close : search} />
          </IonButton>
          <IonButton onClick={openPopover} color="dark">
            <IonIcon slot="icon-only" icon={filter} color={specialityFilter !== ALL ? "secondary" : undefined} />
          </IonButton>
        </>
      }
      />

      <IonPopover
        isOpen={showPopover}
        onDidDismiss={closePopover}
      >
        <div className="ion-padding">
          <div className="d-flex ion-justify-content-between ion-align-items-center">
            <p className="ion-no-margin">
              Filter by <strong>speciality</strong>
            </p>
            <IonButton fill="clear" color="danger" onClick={closePopover}>
              <IonIcon slot="icon-only" icon={close} />
            </IonButton>
          </div>
          <IonList lines="full">
            {[ALL, ...Object.keys(SPECIALITIES)].map((s: string, index: number) => (
              <IonItem
                key={index + s}
                onClick={filterHandlerFactory(s)}
                color={specialityFilter === s ? "secondary" : undefined}
                button
              >
                {s}
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonPopover>

      <IonContent fullscreen className="listing-page">
        {showSearchBar && (
          <SearchBar {...{ fetchProfessionals, closeSearchBar, setListMargin, setSearching }} />
        )}

        {loadError ? (
          <ErrorFallback fullHeight />
        ) : (!viewItems || isSearching) ? (
          <LoadingFallback />
        ) : (
              <IonList lines="full" style={{
                marginTop: listMargin,
              }}>
                {viewItems.map((prof: any) => <ListingItem key={prof._id} prof={prof} />)}
              </IonList>
            )}
      </IonContent>
    </IonPage>
  );
};

export default Listing;

function ListingItem({ prof }: {
  prof: ProfileData
}) {
  return (
    <IonItem routerLink={`/app/profile/${prof._id}`} className="listing-item">
      <IonAvatar slot="start">
        <img src={userPicture(prof)} alt={prof.fullName} />
      </IonAvatar>
      <IonLabel>
        <h3 className="ion-text-capitalize d-flex ion-align-items-center">
          {prof.fullName + "\t"}
          <IonIcon icon={
            prof.accountType === USER.ACCOUNT_TYPES.PROFESSIONAL ?
              person :
              businessOutline
          }
          />
        </h3>
        <p>{prof.bio || "No bio."}</p>
        <RatingInfo userId={prof._id as any} />
        <div className="profile-badges-container d-flex ion-align-items-center">
          {prof.speciality && (
            <IonBadge color="secondary">{prof.speciality}</IonBadge>
          )}
        </div>
      </IonLabel>
    </IonItem>
  );
}

interface SearchBarProps {
  fetchProfessionals: (args: any) => Promise<any>
  closeSearchBar: (args: any) => void
  setListMargin: (args: any) => any
  setSearching: (args: any) => any
}

function SearchBar({ fetchProfessionals, closeSearchBar, setListMargin, setSearching }: SearchBarProps) {
  const { onError } = useToastManager() as any;
  const searchBarRef = useRef(null);

  useEffect(() => {
    setListMargin((searchBarRef.current as any).getBoundingClientRect().height);

    return () => setListMargin(0);
  }, []);

  const handleSearch = async (e: any) => {
    const searchTerm = e.target.value;
    if (!searchTerm) {
      return;
    }

    setSearching(true);

    try {
      await fetchProfessionals({
        username: searchTerm
      });
    } catch (error) {
      onError(error.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="search-bar" ref={searchBarRef}>
      <IonGrid>
        <IonRow>
          <IonCol className="ion-no-padding">
            <IonSearchbar
              onIonChange={debounce(handleSearch, 1500)}
              showCancelButton="focus"
              cancelButtonText="Custom Cancel"
              onIonCancel={closeSearchBar}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
}
