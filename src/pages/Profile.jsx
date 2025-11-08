import { useEffect, useMemo, useState } from 'react';

const Profile = ({ profile, onSave, defaultProfile }) => {
  const fallbackProfile = defaultProfile ?? { name: 'Guest User', interests: ['environment'] };
  const [name, setName] = useState(profile.name ?? '');
  const [interests, setInterests] = useState(profile.interests?.join(', ') ?? '');

  useEffect(() => {
    setName(profile.name ?? '');
    setInterests(profile.interests?.join(', ') ?? '');
  }, [profile]);

  const interestList = useMemo(
    () =>
      interests
        .split(',')
        .map((interest) => interest.trim())
        .filter(Boolean),
    [interests],
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const sanitizedName = name.trim() || fallbackProfile.name;
    onSave({
      name: sanitizedName,
      interests: interestList,
    });
  };

  return (
    <section>
      <form onSubmit={handleSubmit} id="profile-form">
        <h2>Edit Your Profile</h2>

        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="interests">Interests (comma-separated):</label>
          <input
            id="interests"
            type="text"
            value={interests}
            onChange={(event) => setInterests(event.target.value)}
            placeholder="environment, education, community"
          />
        </div>

        <button type="submit">Save Profile</button>
      </form>

      <div className="profile-preview" id="profile-preview">
        <h2>Your Profile</h2>
        <p>
          <strong>Name:</strong> <span id="preview-name">{name || fallbackProfile.name}</span>
        </p>
        <p>
          <strong>Interests:</strong>{' '}
          <span id="preview-interests">{interestList.length ? interestList.join(', ') : 'Add some interests above.'}</span>
        </p>
      </div>
    </section>
  );
};

export default Profile;
